// import { FormMailer } from '@technomoron/form-mailer';
import { FormMailer } from './src/index';

(async () => {
	try {
		const server = new FormMailer({ debug: true });
		await server.start();
	} catch (err) {
		console.error('Failed to start FormMailer:', err);
		process.exit(1);
	}
})();
