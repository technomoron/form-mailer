import { ApiModule, ApiRoute, ApiRequest, ApiServer, ApiError, ApiAuthClass } from '@technomoron/api-server-base';
import nodemailer from 'nodemailer';
import nunjucks from 'nunjucks';

import { formConfig } from './config';

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

		const transporter = nodemailer.createTransport({
			host: 'ml.yesmedia.no',
			port: 25,
			secure: false
		});

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

// console.log(JSON.stringify(forms, undefined, 2));
// process.exit(0);

try {
	new ApiServer({
		apiHost: 'localhost',
		apiPort: 3776,
		uploadPath: 'uploads/'
	})
		.api(new formAPI())
		.start();
} catch (err) {
	console.error(err);
	process.exit(1);
}
