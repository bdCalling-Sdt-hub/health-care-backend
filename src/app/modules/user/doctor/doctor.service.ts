import { CONSULTATION_TYPE } from '../../../../enums/consultation';
import { Consultation } from '../../consultation/consultation.model';

const getDoctorStatus = async (id: string) => {
  const [
    totalRegularConsultation,
    totalVideoConsultation,
    totalMedicationByPatient,
    totalDigitalPrescription,
  ] = await Promise.all([
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.REGULAR,
    }),
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.VIDEO,
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $not: { $size: 0 } },
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $size: 0 },
    }),
  ]);
  const totalAcceptedConsultation = await Consultation.countDocuments({
    doctorId: id,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyAcceptedConsultation = await Consultation.countDocuments({
    doctorId: id,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  return {
    totalEarning: totalAcceptedConsultation * 25,
    dailyEarning: dailyAcceptedConsultation * 25,
    totalRegularConsultation,
    totalVideoConsultation,
    totalMedicationByPatient,
    totalDigitalPrescription,
  };
};

const getDoctorActivityStatusFromDB = async (id: String, year: number) => {
  const today = new Date();
  const currentYear = year || today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Lifetime data
  const [
    lifetimeRegularConsultation,
    lifetimeVideoConsultation,
    lifetimeConsultationWithMeds,
    lifetimeConsultationWithoutMeds,
    totalLifetimeConsultation,
  ] = await Promise.all([
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.REGULAR,
    }),
    Consultation.countDocuments({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.VIDEO,
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $not: { $size: 0 } },
    }),
    Consultation.countDocuments({
      doctorId: id,
      medicines: { $exists: true, $size: 0 },
    }),
    Consultation.countDocuments({
      doctorId: id,
    }),
  ]);

  // Get all months data for the current year
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthsData = await Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const monthFirstDay = new Date(currentYear, month, 1);
      const monthLastDay = new Date(currentYear, month + 1, 0);

      const [regular, video, withMeds, withoutMeds, total] = await Promise.all([
        Consultation.countDocuments({
          doctorId: id,
          consultationType: CONSULTATION_TYPE.REGULAR,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          consultationType: CONSULTATION_TYPE.VIDEO,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          medicines: { $exists: true, $not: { $size: 0 } },
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
        Consultation.countDocuments({
          doctorId: id,
          createdAt: { $gte: monthFirstDay, $lte: monthLastDay },
        }),
      ]);

      return {
        month: monthNames[month],
        regular,
        video,
        withMeds,
        withoutMeds,
        total,
      };
    })
  );

  return {
    lifetime: {
      lifetimeRegularConsultation,
      lifetimeVideoConsultation,
      lifetimeConsultationWithMeds,
      lifetimeConsultationWithoutMeds,
      totalLifetimeConsultation,
    },
    monthlyBreakdown: monthsData,
  };
};

export const DoctorService = {
  getDoctorStatus,
  getDoctorActivityStatusFromDB,
};
