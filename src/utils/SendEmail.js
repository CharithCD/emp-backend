import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendLeaveRequestEmail = async (to, subject, status) => {
    try {
        const message = status === 'approved' 
            ? 'Your leave request has been approved.' 
            : 'Your leave request has been rejected.';
    
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: to,
            subject: subject,
            html: `<p>${message}</p>`,
        });
    
        if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    
        return data;
    } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// export const SendEmail = async (to, subject, text) => {
//   const { data, error } = await resend.emails.send({
//     from: "Acme <onboarding@resend.dev>",
//     to: ["delivered@resend.dev"],
//     subject: "hello world",

//     html: "",
//   });

//   if (error) {
//     return res.status(400).json({ error });
//   }

//   res.status(200).json({ data });
// };
