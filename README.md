# 📬 form-mailer

**Mini service for handling web form submissions and sending them as email.**

---

## Description

This server exposes a single endpoint for sending form submissions via email.

### POST `/api/v1/sendform`

This endpoint accepts multipart form data including:

- `formid` – **Required**. Must match a configured form ID defined in `config/forms.config.json`.
- Any other form fields – Included in the rendered email body.
- File uploads – All attached files are sent as email attachments.

The server uses **Nunjucks templates** to render the email content and **Nodemailer** to deliver the message.

---

## Mail Layout

Each configured form uses a corresponding `.njk` (Nunjucks) template. These templates are rendered with the following context:

```ts
{
  formFields: { ...formData },
  files: [
    {
      originalname: 'filename.ext',
      path: '/path/to/uploaded/file'
    },
    ...
  ]
}
```

This allows for fully custom email layouts that dynamically incorporate submitted form values and attachments.

---

## Configuration

### Mail Form Configuration (`forms.config.json`)

Defines available forms. Each form entry describes the email details and template used.

#### 🧾 Schema

Each form must include:

- `rcpt` _(string)_: Recipient email address (must be valid).
- `sender` _(string)_: Sender email or name (used in the `From:` field).
- `subject` _(string)_: Subject of the outgoing email.
- `template` _(string)_: File name of a `.njk` template inside `config/templates/`.

#### Directory Structure

```
config/
├── forms.config.json         # Form configurations
└── templates/                # Email templates
    ├── contact.njk
    └── feedback.njk
```

#### Example

```json
{
	"contact": {
		"rcpt": "support@example.com",
		"sender": "noreply@example.com",
		"subject": "New contact form submission",
		"template": "contact.njk"
	},
	"feedback": {
		"rcpt": "feedback@example.com",
		"sender": "noreply@example.com",
		"subject": "Feedback received",
		"template": "feedback.njk"
	}
}
```

#### Requirements

- Each `template` file **must exist** under `config/templates/`.
- Templates must be valid [Nunjucks](https://mozilla.github.io/nunjucks/) and renderable with the expected context.
- Templates are pre-validated on startup.

---

## Environment Variables

Below is the list of available options:

| Variable           | Type    | Description                                                        | Default       |
| ------------------ | ------- | ------------------------------------------------------------------ | ------------- |
| `NODE_ENV`         | string  | Specifies the environment (`development`, `production`, `staging`) | `development` |
| `API_PORT`         | number  | Port the API server listens on                                     | `3776`        |
| `API_HOST`         | string  | Host/IP address the server binds to                                | `0.0.0.0`     |
| `SMTP_HOST`        | string  | SMTP server hostname                                               | `localhost`   |
| `SMTP_PORT`        | number  | SMTP server port                                                   | `587`         |
| `SMTP_REQUIRE_TLS` | boolean | Whether to require TLS                                             | `true`        |
| `SMTP_SECURE`      | boolean | Whether to use a secure connection (SSL/TLS)                       | `false`       |
| `SMTP_TLS_REJECT`  | boolean | Reject invalid TLS certificates                                    | `false`       |
| `SMTP_USER`        | string  | Username for SMTP authentication                                   | `""`          |
| `SMTP_PASSWORD`    | string  | Password for SMTP authentication                                   | `""`          |
| `UPLOAD_PATH`      | string  | Directory path to store uploaded files                             | `./uploads/`  |

These variables can be provided via `.env` file or system environment variables.

---

## Example Request

```bash
curl -X POST http://localhost:3776/api/v1/sendform \
  -F "formid=contact" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "message=Hello there!" \
  -F "file=@someimportantfile.txt"
```

This sends form data to the form identified by `contact` in `forms.config.json`, and attaches the given file to the outgoing email.

---

## Extensibility

- Add new forms by editing `forms.config.json` and adding matching templates.
- Customize email layout with Nunjucks logic.
- Deploy securely behind a proxy or authentication middleware, if needed.

---

## Summary

- Validates and parses form config on startup
- Sends rich HTML emails with attachments
- Supports multiple forms and dynamic templates
- Uses environment-based SMTP setup for portability

## Examples

An example config is provided in ./config-example

A default .env file is provided in .env.sample
