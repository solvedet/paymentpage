// api/process-application.js
// Vercel Serverless Function for SolveDet Application Processing

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed. Use POST.' 
        });
    }
    
    try {
        const formData = req.body;
        console.log('Received form data:', formData);
        
        // Validate required fields
        const requiredFields = ['clientName', 'clientEmail', 'clientPhone', 'totalFee', 'currentPayment'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Missing required field: ${field}` 
                });
            }
        }
        
        // Create email transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
        
        // Test email configuration
        try {
            await transporter.verify();
            console.log('Email configuration verified');
        } catch (emailError) {
            console.error('Email configuration error:', emailError);
            return res.status(500).json({
                success: false,
                error: 'Email configuration error. Please check environment variables.'
            });
        }
        
        // Calculate fees safely
        const calculatedFees = formData.calculatedFees || {
            initiationAmount: (formData.totalFee * (formData.initiationPercent || 10)) / 100,
            confirmationAmount: (formData.totalFee * (formData.confirmationPercent || 20)) / 100,
            balanceAmount: (formData.totalFee * (formData.balancePercent || 70)) / 100
        };
        
        const today = new Date().toLocaleDateString('en-IN');
        
        // Business Email HTML
        const businessEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">🎯 NEW SOLVEDET APPLICATION</h1>
                <p style="margin: 10px 0 0 0;">Application received on ${today}</p>
            </div>
            
            <div style="padding: 20px; background: white;">
                <h2 style="color: #1e3c72;">👤 CLIENT DETAILS</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.clientName}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.clientEmail}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.clientPhone}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Constitution:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.constitution}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>PAN:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.clientPAN}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Address:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.clientAddress}</td></tr>
                </table>
                
                ${formData.signatoryName ? `
                <h2 style="color: #1e3c72;">✍️ AUTHORIZED SIGNATORY</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.signatoryName}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Designation:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.designation || 'Not specified'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>PAN:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.signatoryPAN || 'Not provided'}</td></tr>
                </table>
                ` : ''}
                
                <h2 style="color: #1e3c72;">💰 FINANCIAL DETAILS</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Total Service Fee:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><strong>${formData.totalFee.toLocaleString('en-IN')} INR</strong></td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #e8f5e8;"><strong>Initial Processing Fee:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${calculatedFees.initiationAmount.toLocaleString('en-IN')} INR</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Sanction/Confirmation Fee:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${calculatedFees.confirmationAmount.toLocaleString('en-IN')} INR</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa;"><strong>Final Service Fee:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${calculatedFees.balanceAmount.toLocaleString('en-IN')} INR</td></tr>
                    <tr style="background: #fff3cd;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>💳 CURRENT PAYMENT:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><strong style="color: #856404;">${formData.currentPayment.toLocaleString('en-IN')} INR</strong></td></tr>
                </table>
                
                <h2 style="color: #1e3c72;">📋 SERVICE DETAILS</h2>
                <ul style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <li><strong>Service Date:</strong> ${formData.serviceDate || 'Not specified'}</li>
                    <li><strong>Case Reference:</strong> ${formData.caseReference || 'None'}</li>
                    <li><strong>Additional Notes:</strong> ${formData.additionalNotes || 'None'}</li>
                </ul>
                
                <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
                    <h3 style="color: #155724; margin-top: 0;">🚀 NEXT STEPS</h3>
                    <ul style="color: #155724; margin-bottom: 0;">
                        <li>Client is being redirected to Cashfree for payment</li>
                        <li>Monitor payment status in Cashfree dashboard</li>
                        <li>Send signed agreement copy after payment confirmation</li>
                        <li>Initiate service delivery process</li>
                    </ul>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; font-size: 0.9em; color: #666;">
                    <p><strong>Submission Details:</strong></p>
                    <p>Time: ${formData.submissionTimestamp || new Date().toISOString()}<br>
                    User Agent: ${formData.userAgent || 'Not available'}</p>
                </div>
            </div>
        </div>
        `;
        
        // Client Email HTML
        const clientEmailHTML = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">SolveDet</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Consulting Agreement Confirmation</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1e3c72;">Dear ${formData.clientName},</h2>
                
                <p>Thank you for engaging with <strong>Novasolventia Services Private Limited (SolveDet)</strong>.</p>
                
                <p>Please find below the Consulting Agreement details executed on <strong>${today}</strong>, covering the scope of services and fees as agreed. Your payment for the initial processing fee is being processed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e3c72; margin-top: 0;">📋 AGREEMENT DETAILS</h3>
                    <table style="width: 100%;">
                        <tr><td style="padding: 5px 0;"><strong>Client Name:</strong></td><td>${formData.clientName}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong>Constitution:</strong></td><td>${formData.constitution}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong>Authorized Signatory:</strong></td><td>${formData.signatoryName || formData.clientName}, ${formData.designation || (formData.constitution === 'Individual' ? 'Individual' : 'Authorized Signatory')}</td></tr>
                        <tr><td style="padding: 5px 0;"><strong>Agreement Date:</strong></td><td>${today}</td></tr>
                    </table>
                </div>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e3c72; margin-top: 0;">💰 SERVICE FEES BREAKDOWN</h3>
                    <table style="width: 100%;">
                        <tr><td style="padding: 5px 0;"><strong>Total Service Fee:</strong></td><td><strong>${formData.totalFee.toLocaleString('en-IN')} INR</strong></td></tr>
                        <tr><td style="padding: 5px 0;">Initial Processing Fee:</td><td>${calculatedFees.initiationAmount.toLocaleString('en-IN')} INR</td></tr>
                        <tr><td style="padding: 5px 0;">Sanction/Confirmation Fee:</td><td>${calculatedFees.confirmationAmount.toLocaleString('en-IN')} INR</td></tr>
                        <tr><td style="padding: 5px 0;">Final Service Fee:</td><td>${calculatedFees.balanceAmount.toLocaleString('en-IN')} INR</td></tr>
                    </table>
                </div>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">🏢 SERVICES INCLUDED</h3>
                    <ol style="color: #856404; margin: 0; padding-left: 20px;">
                        <li>Debt Resolution</li>
                        <li>Debt Consolidation</li>
                        <li>Fresh Debt Assistance (All loan types)</li>
                        <li>Credit Advisory</li>
                        <li>Restructuring and Resolution Advisory</li>
                        <li>SARFAESI Advisory</li>
                        <li>DSCR and Financial Analysis</li>
                        <li>Legal and Regulatory Support</li>
                    </ol>
                </div>
                
                <p><strong>Please retain this agreement for your records.</strong> The final signed physical copy will be shared after execution.</p>
                
                <hr style="margin: 30px 0;">
                
                <div style="text-align: center; color: #666;">
                    <p><strong>For any queries, contact us at:</strong></p>
                    <p>📧 Email: info@solvedet.com<br>
                    🌐 Website: www.solvedet.com<br>
                    📍 Address: 236, Hubtown Solaris One, Andheri East, Mumbai, Maharashtra 400069</p>
                </div>
                
                <div style="background: #1e3c72; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0;"><strong>Best regards,</strong><br>
                    <strong>SolveDet Team</strong><br>
                    Novasolventia Services Private Limited</p>
                </div>
            </div>
        </div>
        `;
        
        // Send emails
        console.log('Sending business email...');
        await transporter.sendMail({
            from: `"SolveDet Applications" <${process.env.GMAIL_USER}>`,
            to: 'info@solvedet.com',
            subject: `🎯 New SolveDet Application - ${formData.clientName} - ₹${formData.currentPayment.toLocaleString('en-IN')}`,
            html: businessEmailHTML
        });
        
        console.log('Sending client email...');
        await transporter.sendMail({
            from: `"SolveDet Team" <${process.env.GMAIL_USER}>`,
            to: formData.clientEmail,
            subject: `Consulting Agreement Confirmation – SolveDet`,
            html: clientEmailHTML
        });
        
        console.log('Emails sent successfully');
        
        // Return success response
        res.status(200).json({ 
            success: true, 
            message: 'Application processed successfully',
            clientName: formData.clientName,
            paymentAmount: formData.currentPayment,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error processing application:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error. Please try again.',
            details: error.message
        });
    }
};