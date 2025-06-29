import { ApiModule, ApiRoute, ApiRequest, ApiServer, ApiError, ApiAuthClass } from '@technomoron/api-server-base';
import { createTransport } from 'nodemailer';
import nunjucks from 'nunjucks';

import { formConfig } from './config';
import { env } from './env';

import type SMTPTransport from 'nodemailer/lib/smtp-transport';

function create_mail_transport() {
	const args: SMTPTransport.Options = {
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		tls: {
			rejectUnauthorized: env.SMTP_TLS_REJECT
		},
		requireTLS: true,
		logger: true,
		debug: true
	};
	const user = env.SMTP_USER;
	const pass = env.SMTP_PASSWORD;
	if (user && pass) {
		args.auth = { user, pass };
	}
	// console.log(JSON.stringify(args, undefined, 2));

	const mailer = createTransport({
		...args
	});
	if (!mailer) {
		throw new Error('Unable to create mailer');
	}
	return mailer;
}

class formAPI extends ApiModule<ApiServer> {
	private async postSendForm(apireq: ApiRequest): Promise<[number, any]> {
		const { formid } = apireq.req.body;

		console.log('Headers:', apireq.req.headers);
		console.log('Body:', JSON.stringify(apireq.req.body, null, 2));
		console.log('Files:', JSON.stringify(apireq.req.files, null, 2));

		if (!formid) {
			throw new ApiError({ code: 404, message: 'Missing formid field in form' });
		}
		if (!forms[formid]) {
			throw new ApiError({ code: 404, message: `No such form ${formid}` });
		}
		const form = forms[formid];

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

		const transporter = create_mail_transport();

		const mailOptions = {
			from: form.sender,
			to: form.rcpt,
			subject: form.subject,
			html,
			attachments
		};

		try {
			const info = await transporter.sendMail(mailOptions);
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

const forms = formConfig();

console.log(JSON.stringify(env, undefined, 2));
// console.log(JSON.stringify(forms, undefined, 2));
// process.exit(0);

try {
	new ApiServer({
		apiHost: env.API_HOST,
		apiPort: env.API_PORT,
		uploadPath: env.UPLOAD_PATH
	})
		.api(new formAPI())
		.start();
} catch (err) {
	console.error(err);
	process.exit(1);
}
