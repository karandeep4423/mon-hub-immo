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
}

export const emailService = new EmailService();
