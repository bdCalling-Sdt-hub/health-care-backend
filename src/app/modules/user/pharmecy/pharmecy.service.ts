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
  const totalEarning = await Consultation.countDocuments({ paid: true });
  const totalDailyEarning = await Consultation.aggregate([
    {
      $match: {
        paid: true,
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$earning' },
      },
    },
  ]);
  return {
    totalRemaining,
    totalResolved,
    totalDailyEarning,
    totalEarning,
  };
};

export const PharmecyService = {
  getPharmecyStatus,
};
