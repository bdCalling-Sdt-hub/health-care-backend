import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { Consultation } from '../../consultation/consultation.model';
const getPharmecyStatus = async (id: string) => {
  const totalResolved = await Consultation.countDocuments({
    forwardToPartner: true,
    status: 'accepted',
  });
  const totalRemaining = await Consultation.countDocuments({
    forwardToPartner: true,
    status: { $ne: 'accepted' },
  });

  return {
    totalRemaining,
    totalResolved,
  };
};

export const PharmecyService = {
  getPharmecyStatus,
};
