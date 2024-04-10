import {createServer} from 'https'
import * as fs from "fs";
import "dotenv/config";


import socketManagement from './socket_management'
import {Server, Socket} from "socket.io";
import {Group} from "./class";
import {rmqHandlers} from "./rmq/rmqHandlers";


const hostname = process.env.HOST_NAME as string;
const port = process.env.PORT as string;

console.log({hostname, port})


const httpServer = createServer(
    {
        key: fs.readFileSync("/etc/letsencrypt/live/srv.travelerapp.ru/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/srv.travelerapp.ru/fullchain.pem")
    }
)
const io = new Server(httpServer, {
    cors: {
        origin: `*`,
        methods: ["GET", "POST"]
    },
});


const userGroups = new Group<Socket>()

const handle = socketManagement(userGroups)


io.on("connection", (socket) => {
    socket.on('travel:join', handle.joinToTravel)
    socket.on('travel:leave', handle.leaveFromTravel)
    socket.on('travel:action', handle.newTravelAction)
    socket.on('travel:message', handle.newTravelMessage)
    socket.on('expense:action', handle.newExpenseAction)
    socket.on('limit:action', handle.newLimitAction)
    socket.on('disconnect', handle.disconnect)
});

const rmq = rmqHandlers(userGroups)

rmq.handleRMQMessage()

httpServer.listen(Number(port))

