import nodemailer from 'nodemailer';

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: parseInt(process.env.EMAIL_PORT || '587'),
			secure: false,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}

	async sendEmail(options: EmailOptions): Promise<void> {
		const mailOptions = {
			from: process.env.EMAIL_FROM,
			to: options.to,
			subject: options.subject,
			html: options.html,
		};

		await this.transporter.sendMail(mailOptions);
	}

	generateVerificationCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	getVerificationCodeTemplate(name: string, code: string): string {
		return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification Code</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            padding: 30px 20px; 
            background: white;
          }
          .code-container {
            background: #f8f9fa;
            border: 2px dashed #007bff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #007bff;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
          }
          .instructions {
            background: #e3f2fd;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            font-size: 12px; 
            color: #666;
            background: #f8f9fa;
          }
          .warning {
            color: #dc3545;
            font-size: 14px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with us! To complete your registration, please use the verification code below:</p>
            
            <div class="code-container">
              <div class="code">${code}</div>
            </div>
            
            <div class="instructions">
              <strong>Instructions:</strong>
              <ul>
                <li>Enter this code in the verification form</li>
                <li>This code will expire in 24 hours</li>
                <li>Do not share this code with anyone</li>
              </ul>
            </div>
            
            <p>Once verified, you'll be able to access your account and all our features.</p>
            
            <div class="warning">
              <strong>Security Note:</strong> If you didn't create this account, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
	}

	getPasswordResetTemplate(name: string, code: string): string {
		return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset Code</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #dc3545, #a71e2a);
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content { 
          padding: 30px 20px; 
          background: white;
        }
        .code-container {
          background: #f8f9fa;
          border: 2px dashed #dc3545;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #dc3545;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        .instructions {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          font-size: 12px; 
          color: #666;
          background: #f8f9fa;
        }
        .warning {
          color: #dc3545;
          font-size: 14px;
          margin-top: 20px;
          padding: 15px;
          background: #f8d7da;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset your password. Use the code below to set your new password:</p>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <div class="instructions">
            <strong>⚠️ Important Instructions:</strong>
            <ul>
              <li>This code will expire in <strong>1 hour</strong></li>
              <li>Enter this code along with your new password</li>
              <li>Keep this code confidential</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>After entering the code, you'll be able to create a new secure password for your account.</p>
          
          <div class="warning">
            <strong>🔐 Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 HubImmo. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
	}

	getPasswordResetConfirmationTemplate(name: string): string {
		return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Successfully Reset</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #28a745, #1e7e34);
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content { 
          padding: 30px 20px; 
          background: white;
        }
        .success-box {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .checkmark {
          font-size: 48px;
          color: #28a745;
          margin-bottom: 10px;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          font-size: 12px; 
          color: #666;
          background: #f8f9fa;
        }
        .security-tips {
          background: #e3f2fd;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          
          <div class="success-box">
            <div class="checkmark">✓</div>
            <h3>Your password has been successfully reset!</h3>
            <p>You can now log in with your new password.</p>
          </div>
          
          <p>Your HubImmo account password has been successfully changed. You are now automatically logged in to your account.</p>
          
          <div class="security-tips">
            <strong>🔒 Security Tips:</strong>
            <ul>
              <li>Keep your password secure and don't share it with anyone</li>
              <li>Use a unique password for your HubImmo account</li>
              <li>Consider enabling two-factor authentication</li>
              <li>If you notice any suspicious activity, contact support immediately</li>
            </ul>
          </div>
          
          <p>If you did not make this change, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 HubImmo. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
	}
}

export const emailService = new EmailService();
