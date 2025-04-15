import { Resend } from "resend";

const resend = new Resend("re_6QnfseSa_6TXYzBgLqkbEsei3Md7eSohE");

const sendReservationEmail = async (students, classroom, hours, day, user) => {
const emailBody = `   <p>Hola,</p>
    <p>Se ha realizado una reserva para el aula <strong>${classroom}</strong> el día <strong>${day}</strong>.</p>
    <p><strong>Horario:</strong> ${hours.join(", ")}</p>
    <p><strong>Alumnos:</strong> ${students.join(", ")}</p>
    <p><strong>Reservado por:</strong> ${user}</p>
    <p>Gracias.</p>
`;

try {
await resend.emails.send({
from: "Reservas <mponce.alum.practiques@itaeb.cat>",
to: ["mponce.alum.practiques@itaeb.cat"], // Cambia esto a los destinatarios reales
subject: `Nueva Reserva - ${classroom}`,
html: emailBody,
});
} catch (error) {
console.error("Error enviando correo:", error);
}
};
