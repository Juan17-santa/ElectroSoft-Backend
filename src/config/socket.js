import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    const configuredOrigins = process.env.CLIENT_ORIGIN
        ?.split(",")
        .map(origin => origin.trim())
        .filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: configuredOrigins?.length ? configuredOrigins : true,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado a WebSockets:", socket.id);

        socket.on("disconnect", () => {
            console.log("Cliente desconectado:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io no está inicializado.");
    }
    return io;
};
