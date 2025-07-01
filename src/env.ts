import { defineEnvOptions } from '@technomoron/env-loader';

export const envOptions = defineEnvOptions({
	NODE_ENV: {
		description: 'Specifies the environment in which the app is running',
		options: ['development', 'production', 'staging'],
		default: 'development'
	},
	API_PORT: {
		description: 'Defines the port on which the app listens. Default 3780',
		default: '3776',
		type: 'number'
	},
	API_HOST: {
		description: 'Sets the local IP address for the API to listen at',
		default: '0.0.0.0'
	},
	CONFIG_PATH: {
		description: 'Configuration path',
		default: './config'
	},
	DEBUG: {
		description: 'Enable debug output, including nodemailer and API',
		default: false,
		type: 'boolean'
	},
	SMTP_HOST: {
		description: 'Hostname of SMTP sending host',
		default: 'localhost'
	},
	SMTP_PORT: {
		description: 'SMTP host server port',
		default: 587,
		type: 'number'
	},
	SMTP_REQUIRE_TLS: {
		description: 'Require use of TLS',
		default: true,
		type: 'boolean'
	},
	SMTP_SECURE: {
		description: 'Use secure connection to SMTP host (SSL/TSL)',
		default: false,
		type: 'boolean'
	},
	SMTP_TLS_REJECT: {
		description: 'Reject bad cert/TLS connection to SMTP host',
		default: false,
		type: 'boolean'
	},
	SMTP_USER: {
		description: 'Username for SMTP host',
		default: ''
	},
	SMTP_PASSWORD: {
		description: 'Password for SMTP host',
		default: ''
	},
	UPLOAD_PATH: {
		description: 'Path for attached files',
		default: './uploads/'
	}
});
