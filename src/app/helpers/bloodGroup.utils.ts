import { BloodGroup } from "../../generated/prisma";


export const bloodGroupMap: Record<string, BloodGroup> = {
  'A+': BloodGroup.A_POSITIVE,
  'A-': BloodGroup.A_NEGATIVE,
  'B+': BloodGroup.B_POSITIVE,
  'B-': BloodGroup.B_NEGATIVE,
  'AB+': BloodGroup.AB_POSITIVE,
  'AB-': BloodGroup.AB_NEGATIVE,
  'O+': BloodGroup.O_POSITIVE,
  'O-': BloodGroup.O_NEGATIVE,
};

export const reverseBloodGroupMap: Record<string, string> = Object.fromEntries(
  Object.entries(bloodGroupMap).map(([k, v]) => [v, k])
);

export const mapBloodGroupToEnum = (bloodGroup: string): BloodGroup => {
  const mapped = bloodGroupMap[bloodGroup];
  if (!mapped) {
    throw new Error(`Invalid blood group: ${bloodGroup}`);
  }
  return mapped;
};

export const mapEnumToBloodGroup = (bloodGroup: BloodGroup): string => {
  return reverseBloodGroupMap[bloodGroup] || bloodGroup;
};
