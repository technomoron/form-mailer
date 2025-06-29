import { apiModule, apiRoute, apiRequest, apiServer, apiError, apiAuthClass } from 'doc-api-server';
import nodemailer from 'nodemailer';
import nunjucks from 'nunjucks';

import { forms } from './forms';

class formAPI extends apiModule {
	private async post_sendform(apireq: apiRequest): Promise<[number, any]> {
		const { formid } = apireq.req.body;

		console.log('Headers:', apireq.req.headers);
		console.log('Body:', JSON.stringify(apireq.req.body, null, 2));
		console.log('Files:', JSON.stringify(apireq.req.files, null, 2));

		if (!formid) {
			throw new apiError({ code: 404, error: 'Missing formid field in form' });
		}
		if (!forms[formid]) {
			throw new apiError({ code: 404, error: `No such form ${formid}` });
		}
		const form = forms[formid];

		const attachments = Array.isArray(apireq.req.files)
			? apireq.req.files.map((file: any) => ({
					filename: file.originalname,
					path: file.path,
				}))
			: [];

		const context = {
			formFields: apireq.req.body,
			files: Array.isArray(apireq.req.files) ? apireq.req.files : [],
		};

		nunjucks.configure({ autoescape: true });
		const html = nunjucks.renderString(form.template, context);

		const transporter = nodemailer.createTransport({
			host: 'm.document.no',
			port: 25,
			secure: false,
		});

		const mailOptions = {
			from: form.sender,
			to: form.rcpt,
			subject: form.subject,
			html,
			attachments,
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

	override define_routes(): apiRoute[] {
		return [{ method: 'post', path: '/sendform', handler: this.post_sendform, auth: { type: 'none', req: 'any' } }];
	}
}

const server = new apiServer({
	api_host: 'localhost',
	api_port: 3776,
	upload_path: 'uploads/',
});

new formAPI().init(server);

server.start();
