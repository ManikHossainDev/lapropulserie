import express from 'express';
import validateRequest from '../../shared/validateRequest';
import { recommendFriendValidation } from './recommendFriend.validation';
import { recommendFriend } from './recommendFriend.controller';

const router = express.Router();

/** Public — marketing “Envoyez-lui le bilan gratuit” */
router.post('/', validateRequest(recommendFriendValidation), recommendFriend);

export const RecommendFriendRoute = router;
