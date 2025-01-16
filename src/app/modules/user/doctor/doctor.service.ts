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

const getDoctorActivityStatusFromDB = async (id: string, year: number) => {
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
const getDoctorEarningStatusFromDB = async (id: string, year: number) => {
  const result = await getDoctorActivityStatusFromDB(id, year);
  return {
    lifetime: Object.fromEntries(
      Object.entries(result.lifetime).map(([key, value]) => [
        key,
        typeof value === 'number' ? value * 25 : value,
      ])
    ),
    monthlyBreakdown: result.monthlyBreakdown.map(month =>
      Object.fromEntries(
        Object.entries(month).map(([key, value]) => [
          key,
          typeof value === 'number' ? value * 25 : value,
        ])
      )
    ),
  };
};
const setUpStripeConnectAccount = async (
  data: any,
  files: any,
  user: any,
  paths: any,
  ip: string
): Promise<string> => {
  const values = await JSON.parse(data);

  const isExistUser = await Teacher.findOne({ email: user?.email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.email !== user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email doesn't match");
  }
  const dob = new Date(values.dateOfBirth);

  // Process KYC
  const KYCFiles = files;
  if (!KYCFiles || KYCFiles.length < 2) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Two KYC files are required!');
  }
  const uploadsPath = path.join(__dirname, '../../../..');

  // File upload to Stripe
  const frontFileId = await uploadFileToStripe(
    `${uploadsPath}/uploads/${paths[0]}`
  );
  const backFileId = await uploadFileToStripe(
    `${uploadsPath}/uploads/${paths[1]}`
  );

  // Create token
  const token = await stripe.tokens.create({
    account: {
      individual: {
        dob: {
          day: dob.getDate(),
          month: dob.getMonth() + 1,
          year: dob.getFullYear(),
        },
        id_number: values.idNumber,
        first_name:
          values.name.split(' ')[0] ||
          isExistUser.name.split(' ')[0] ||
          isExistUser.name,
        last_name:
          values.name.split(' ')[1] ||
          isExistUser.name.split(' ')[1] ||
          isExistUser.name,
        email: user.email,
        phone: values.phoneNumber,
        address: {
          city: values.address.city,
          country: values.address.country,
          line1: values.address.line1,
          state: values.address.state,
          postal_code: values.address.postal_code,
        },
        ...(values.idNumber && { ssn_last_4: values.idNumber.slice(-4) }),
        verification: {
          document: {
            front: frontFileId,
            back: backFileId,
          },
        },
      },
      business_type: 'individual',
      tos_shown_and_accepted: true,
    },
  });
  // Create account
  const account = await stripe.accounts.create({
    type: 'custom',
    country: values.address.country,
    email: values.email || isExistUser.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: '5734',
      name: `${isExistUser.name}`,
      url: 'https://medspaceconnect.com',
    },
    external_account: {
      object: 'bank_account',
      account_number: values.bank_info.account_number,
      country: values.bank_info.country,
      currency: values.bank_info.currency,
      account_holder_name: values.bank_info.account_holder_name,
      account_holder_type: values.bank_info.account_holder_type,
      routing_number: values.bank_info.routing_number,
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: ip, // Replace with the user's actual IP address
    },
  });

  // Update account with additional information
  await stripe.accounts.update(account.id, {
    account_token: token.id,
  });

  // Save to the DB
  if (account.id && account?.external_accounts?.data.length) {
    //@ts-ignore
    isExistUser.accountInformation.stripeAccountId = account.id;
    //@ts-ignore
    isExistUser.accountInformation.bankAccountNumber =
      values.bank_info.account_number;
    //@ts-ignore
    isExistUser.accountInformation.externalAccountId =
      account.external_accounts.data[0].id;
    //@ts-ignore
    isExistUser.accountInformation.status = 'active';
    await Teacher.findByIdAndUpdate(user.id, isExistUser);
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: config.stripe_refresh_url || 'https://example.com/reauth',
    return_url: config.stripe_return_url || 'https://example.com/return',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  return accountLink.url;
};

export const DoctorService = {
  getDoctorStatus,
  getDoctorActivityStatusFromDB,
  getDoctorEarningStatusFromDB,
  setUpStripeConnectAccount,
};
