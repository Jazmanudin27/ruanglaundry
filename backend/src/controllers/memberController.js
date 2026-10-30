import * as memberService from '../services/memberService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  createMemberSchema,
  updateMemberSchema,
  gantiKartuSchema,
  perpanjangMemberSchema,
} from '../validators/memberValidator.js';

export const listMembers = async (req, res, next) => {
  try {
    const { search, filter, page, limit } = req.query;
    const result = await memberService.getMembers({ search, filter, page, limit });
    return successResponse(res, 200, 'Daftar member berhasil diambil', result);
  } catch (error) {
    return next(error);
  }
};

export const getMember = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    return successResponse(res, 200, 'Detail member berhasil diambil', member);
  } catch (error) {
    return errorResponse(res, 404, error.message || 'Member tidak ditemukan');
  }
};

export const getMemberByUid = async (req, res, next) => {
  try {
    const member = await memberService.getMemberByUid(req.params.uid);
    return successResponse(res, 200, 'Member ditemukan dari scan kartu', member);
  } catch (error) {
    return errorResponse(res, 404, error.message || 'Member tidak ditemukan');
  }
};

export const createMember = async (req, res, next) => {
  try {
    const validated = createMemberSchema.parse(req.body);
    const member = await memberService.createMember(validated);
    return successResponse(res, 201, 'Member baru berhasil didaftarkan', member);
  } catch (error) {
    if (error.message.includes('sudah digunakan')) {
      return errorResponse(res, 409, error.message);
    }
    return next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const validated = updateMemberSchema.parse(req.body);
    const updated = await memberService.updateMember(req.params.id, validated);
    return successResponse(res, 200, 'Data member berhasil diubah', updated);
  } catch (error) {
    if (error.message.includes('sudah dipakai')) {
      return errorResponse(res, 409, error.message);
    }
    return next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    await memberService.deleteMember(req.params.id);
    return successResponse(res, 200, 'Member berhasil dihapus');
  } catch (error) {
    return next(error);
  }
};

export const gantiKartu = async (req, res, next) => {
  try {
    const validated = gantiKartuSchema.parse(req.body);
    const member = await memberService.gantiKartu(req.params.id, validated.uidKartuBaru);
    return successResponse(res, 200, 'Kartu NFC berhasil diganti', member);
  } catch (error) {
    if (error.message.includes('sudah digunakan')) {
      return errorResponse(res, 409, error.message);
    }
    return next(error);
  }
};

export const perpanjangMember = async (req, res, next) => {
  try {
    const validated = perpanjangMemberSchema.parse(req.body);
    const result = await memberService.perpanjangMember(
      req.params.id,
      validated.paketId,
      validated.hargaDibayar,
      req.user.id
    );
    return successResponse(res, 200, 'Perpanjangan paket berhasil', result);
  } catch (error) {
    return next(error);
  }
};

export const getHampirHabis = async (req, res, next) => {
  try {
    const members = await memberService.getMembersHampirHabis();
    return successResponse(res, 200, 'Daftar member hampir habis berhasil diambil', members);
  } catch (error) {
    return next(error);
  }
};
