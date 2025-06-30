import { ApiModule, ApiRoute, ApiRequest, ApiServer, ApiError, ApiServerConf } from '@technomoron/api-server-base';
import EnvLoader, { envConfig } from '@technomoron/env-loader';
import { createTransport, Transporter } from 'nodemailer';
import nunjucks from 'nunjucks';

import { formConfig } from './config';
import { envOptions } from './env';

import type SMTPTransport from 'nodemailer/lib/smtp-transport';

function create_mail_transport(env: envConfig<typeof envOptions>): Transporter {
	const args: SMTPTransport.Options = {
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		tls: {
			rejectUnauthorized: env.SMTP_TLS_REJECT
		},
		requireTLS: true,
		logger: env.DEBUG,
		debug: env.DEBUG
	};
	const user = env.SMTP_USER;
	const pass = env.SMTP_PASSWORD;
	if (user && pass) {
		args.auth = { user, pass };
	}
	// console.log(JSON.stringify(args, undefined, 2));

	const mailer: Transporter = createTransport({
		...args
	});
	if (!mailer) {
		throw new Error('Unable to create mailer');
	}
	return mailer;
}

class FormAPI extends ApiModule<FormMailer> {
	private async postSendForm(apireq: ApiRequest): Promise<[number, any]> {
		const { formid } = apireq.req.body;

		console.log('Headers:', apireq.req.headers);
		console.log('Body:', JSON.stringify(apireq.req.body, null, 2));
		console.log('Files:', JSON.stringify(apireq.req.files, null, 2));

		if (!formid) {
			throw new ApiError({ code: 404, message: 'Missing formid field in form' });
		}
		if (!this.server.forms[formid]) {
			throw new ApiError({ code: 404, message: `No such form ${formid}` });
		}
		const form = this.server.forms[formid];

		const a = Array.isArray(apireq.req.files) ? apireq.req.files : [];
		const attachments = a.map((file: any) => ({
			filename: file.originalname,
			path: file.path
		}));

		const context = {
			formFields: apireq.req.body,
			files: Array.isArray(apireq.req.files) ? apireq.req.files : []
		};

		nunjucks.configure({ autoescape: true });
		const html = nunjucks.renderString(form.templateContent, context);

		const mailOptions = {
			from: form.sender,
			to: form.rcpt,
			subject: form.subject,
			html,
			attachments
		};

		try {
			const info = await this.server.transporter.sendMail(mailOptions);
			console.log('Email sent: ' + info.response);
		} catch (error) {
			console.error('Error sending email:', error);
			return [500, { error: 'Error sending email: error' }];
		}

		return [200, {}];
	}

	override defineRoutes(): ApiRoute[] {
		return [
			{
				method: 'post',
				path: '/v1/sendform',
				handler: (req) => this.postSendForm(req),
				auth: { type: 'none', req: 'any' }
			}
		];
	}
}

export class FormMailer extends ApiServer {
	public readonly env: envConfig<typeof envOptions>;
	public readonly forms: ReturnType<typeof formConfig>;
	public readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

	constructor(apiOptions?: Partial<ApiServerConf>, forms: ReturnType<typeof formConfig> | undefined = undefined) {
		apiOptions ||= {};
		const env = EnvLoader.createConfigProxy(envOptions, { debug: apiOptions.debug });
		if (env.DEBUG) {
			apiOptions.debug = true;
		}
		if (apiOptions.debug) {
			EnvLoader.genTemplate(envOptions, './.env.sample');
		}
		super({
			apiHost: env.API_HOST,
			apiPort: env.API_PORT,
			uploadPath: env.UPLOAD_PATH,
			...apiOptions
		});

		this.env = env;
		this.forms = forms || formConfig();
		this.transporter = create_mail_transport(env);

		this.api(new FormAPI(this.forms));
	}
}
