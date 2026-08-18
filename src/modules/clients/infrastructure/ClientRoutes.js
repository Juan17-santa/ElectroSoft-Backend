import { Router } from 'express';
import { requireAuth } from '../../../infrastructure/middlewares/requireAuth.js';
import { requirePermission } from '../../../infrastructure/middlewares/requirePermission.js';
import {
    createClient,
    getClients,
    getClientById,
    getClientByDocument,
    updateClient,
    deleteClient,
    updateCupo,
    checkEmail,
    checkDocument
} from './ClientController.js';

const router = Router();

router.get('/check-email', requireAuth, checkEmail);
router.get('/check-document', requireAuth, checkDocument);

router.post('/', requireAuth, requirePermission("clientes:crear"), createClient);
router.get('/', requireAuth, requirePermission("clientes:acceso", "clientes:ver"), getClients);
router.get('/document/:documentNumber', requireAuth, requirePermission("clientes:acceso", "clientes:ver"), getClientByDocument);
router.get('/:id', requireAuth, requirePermission("clientes:ver"), getClientById);
router.put('/:id', requireAuth, requirePermission("clientes:editar"), updateClient);
router.patch('/:id/cupo', requireAuth, requirePermission("clientes:cupo"), updateCupo);
router.delete('/:id', requireAuth, requirePermission("clientes:eliminar"), deleteClient);

export default router;
