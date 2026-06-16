import { Router } from 'express';
import {
    createClient,
    getClients,
    getClientById,
    getClientByDocument,
    updateClient,
    deleteClient,
    updateCupo
} from './ClientController.js';

const router = Router();

router.post('/', createClient);
router.get('/', getClients);
router.get('/document/:documentNumber', getClientByDocument);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.patch('/:id/cupo', updateCupo);
router.delete('/:id', deleteClient);

export default router;
