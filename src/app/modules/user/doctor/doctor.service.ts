import { CONSULTATION_TYPE } from '../../../../enums/consultation';
import { Consultation } from '../../consultation/consultation.model';

const getDoctorStatus = async (id: string) => {
  const [
    totalRegularConsultation,
    totalVideoConsultation,
    totalMedicationByPatient,
    totalDigitalPrescription,
  ] = await Promise.all([
    Consultation.find({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.REGULAR,
    }),
    Consultation.find({
      doctorId: id,
      consultationType: CONSULTATION_TYPE.VIDEO,
    }),
    Consultation.find({
      doctorId: id,
      medicines: { $exists: true, $not: { $size: 0 } },
    }),
    Consultation.find({ doctorId: id, medicines: { $exists: true, $size: 0 } }),
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

export const DoctorService = {
  getDoctorStatus,
};
