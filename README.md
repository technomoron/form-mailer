# doc-form-mailer

Mini service for handling web form submission and sending them as mail.

## Description.

The server has only one endpoint, of type POST:

/sendform

Only one argument is required:

formid

The value of this argument must match a form defined in src/forms.ts

The formType in this config consists of four fields:

rcpt: The receiving email for the submission
sender: The email/name of the sender for outgoing template
subject: The subject of the outgoing mail
template: A nunjucts template string to use for the outgoing mail.

All other form fields and attached files are passed on by default.

## Configuration

No configuration is currently possible. It binds to localhost port 3776,
uses m.document.no:25 (no secure) as outgoing mail server.

## Mail layout

Currently uses nunjucks to create an outgoing mail template. The default
template only dumps the form submissions fields and attaches all files
posted to the /sendform endpoint.

## Example

curl -X POST http://localhost:3776/api/v1/sendform \
 -F "formid=myformid" \
 -F "field1=value1" \
 -F "file=@someimportantfile.txt"

This command will post an argument field1 and attach a file, sending it
to the form defined by 'formid' (see src/forms.ts - and make your own!)
