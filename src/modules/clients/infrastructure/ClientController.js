import CreateClientUseCase from '../application/CreateClientUseCase.js';
import GetClientsUseCase from '../application/GetClientsUseCase.js';
import GetClientByIdUseCase from '../application/GetClientByIdUseCase.js';
import UpdateClientUseCase from '../application/UpdateClientUseCase.js';
import DeleteClientUseCase from '../application/DeleteClientUseCase.js';
import { clientRepository } from './ClientRepository.js';
import DocumentTypeRepositoryMongo from '../../../shared/infrastructure/repositories/DocumentTypeRepositoryMongo.js';
import mongoose from 'mongoose';
import NotificationService from "../../notifications/application/NotificationService.js";
import GetClientByDocumentUseCase from '../application/GetClientByDocumentUseCase.js';

const documentTypeRepository = new DocumentTypeRepositoryMongo();

export const createClient = async (req, res) => {
    try {
        const useCase = new CreateClientUseCase(clientRepository, documentTypeRepository);
        const client = await useCase.execute(req.body);
        res.status(201).json({ message: "Cliente creado exitosamente", client });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const getClients = async (req, res) => {
    try {
        const useCase = new GetClientsUseCase(clientRepository);
        const clients = await useCase.execute();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetClientByIdUseCase(clientRepository);
        const client = await useCase.execute(req.params.id);
        res.status(200).json(client);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const getClientByDocument = async (req, res) => {
    try {
        const { documentNumber } = req.params;
        
        const useCase = new GetClientByDocumentUseCase(clientRepository);
        const client = await useCase.execute(documentNumber);
        res.status(200).json(client);
    } catch (error) {
        res.status(404).json({
            error: error.message
        });
    }
};

export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new UpdateClientUseCase(clientRepository, documentTypeRepository);
        const client = await useCase.execute(req.params.id, req.body);
        res.status(200).json({ message: "Cliente actualizado exitosamente", client });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new DeleteClientUseCase(clientRepository);
        const result = await useCase.execute(req.params.id);
        res.status(200).json({ message: "Cliente eliminado exitosamente", client: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const updateCupo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const { cupoTotal, cupoActivo, estado } = req.body;

        const updateData = {};
        if (cupoTotal !== undefined) updateData.cupoTotal = Number(cupoTotal);
        if (cupoActivo !== undefined) updateData.cupoActivo = Boolean(cupoActivo);
        if (estado !== undefined) updateData.estado = Boolean(estado);

        const { ClientModel } = await import('./ClientModel.js');
        const client = await ClientModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: "after" }
        ).populate('documentType');

        if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

        // Emitir notificación si se le asignó/actualizó el cupo
        if (cupoTotal !== undefined) {
            const clientName = `${client.firstName} ${client.lastName}`.trim();
            const formattedCupo = Number(cupoTotal).toLocaleString("es-CO");
            await NotificationService.createNotification(
                "Cupo Asignado",
                `Se le ha asignado un cupo de $${formattedCupo} a ${clientName}.`,
                "USER",
                `/clients/${client._id}`
            );
        }

        res.status(200).json({ message: "Cupo/estado actualizado", client });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
