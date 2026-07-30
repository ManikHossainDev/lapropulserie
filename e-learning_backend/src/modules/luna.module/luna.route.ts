import express from 'express';
import auth from '../../middlewares/auth';
import { TRole } from '../../middlewares/roles';
import validateRequest from '../../shared/validateRequest';
import { lunaChatValidation } from './luna.validation';
import { lunaChat } from './luna.controller';

const router = express.Router();

router.post('/chat', auth(TRole.student), validateRequest(lunaChatValidation), lunaChat);

export const LunaRoute = router;
