import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Email options
    const mailOptions = {
        from: `JobPortal <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

// Welcome email template
export const sendWelcomeEmail = async (user) => {
    const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Welcome to JobPortal!</h1>
            <p>Hi ${user.fullname},</p>
            <p>Thank you for joining JobPortal. We're excited to help you ${user.role === 'student' ? 'find your dream job' : 'find the perfect candidates'}!</p>
            <p>To get started:</p>
            <ul>
                <li>Complete your profile</li>
                <li>${user.role === 'student' ? 'Browse available jobs' : 'Post your first job'}</li>
                <li>${user.role === 'student' ? 'Upload your resume' : 'Set up your company profile'}</li>
            </ul>
            <a href="${process.env.CLIENT_URL}/profile" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Complete Your Profile</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The JobPortal Team</p>
        </div>
    `;

    await sendEmail({
        email: user.email,
        subject: 'Welcome to JobPortal!',
        message
    });
};

// Application confirmation email
export const sendApplicationEmail = async (user, job, company) => {
    const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Application Submitted Successfully!</h1>
            <p>Hi ${user.fullname},</p>
            <p>Your application for the position of <strong>${job.title}</strong> at <strong>${company.name}</strong> has been submitted successfully.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Job Details:</h3>
                <p><strong>Position:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${company.name}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Job Type:</strong> ${job.jobType}</p>
            </div>
            <p>The employer will review your application and get back to you soon.</p>
            <a href="${process.env.CLIENT_URL}/profile" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">View Your Applications</a>
            <p>Good luck!</p>
            <p>Best regards,<br>The JobPortal Team</p>
        </div>
    `;

    await sendEmail({
        email: user.email,
        subject: `Application Submitted - ${job.title}`,
        message
    });
};

// Application status update email
export const sendStatusUpdateEmail = async (user, job, company, status) => {
    const statusMessages = {
        accepted: {
            title: 'Congratulations! Your Application Has Been Accepted',
            message: 'We have great news! Your application has been accepted.',
            color: '#059669'
        },
        rejected: {
            title: 'Application Status Update',
            message: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.',
            color: '#dc2626'
        }
    };

    const statusInfo = statusMessages[status];

    const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${statusInfo.color};">${statusInfo.title}</h1>
            <p>Hi ${user.fullname},</p>
            <p>${statusInfo.message}</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Job Details:</h3>
                <p><strong>Position:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${company.name}</p>
                <p><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${status.toUpperCase()}</span></p>
            </div>
            ${status === 'accepted' ? '<p>The employer may contact you soon for the next steps.</p>' : '<p>We encourage you to keep applying to other opportunities on JobPortal.</p>'}
            <a href="${process.env.CLIENT_URL}/jobs" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Browse More Jobs</a>
            <p>Best regards,<br>The JobPortal Team</p>
        </div>
    `;

    await sendEmail({
        email: user.email,
        subject: `Application Status Update - ${job.title}`,
        message
    });
};
