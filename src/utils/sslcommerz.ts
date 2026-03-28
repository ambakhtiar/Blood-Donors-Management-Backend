import SSLCommerzPayment from "sslcommerz-lts";
import { envVars } from "../app/config/env";

const store_id = envVars.SSL_COMMERZ.STORE_ID;
const store_passwd = envVars.SSL_COMMERZ.STORE_PASSWORD;
const is_live = envVars.SSL_COMMERZ.IS_LIVE;

const initPayment = async (paymentData: Record<string, unknown>) => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const result = await sslcz.init(paymentData);
  return result;
}

const validatePayment = async (data: Record<string, unknown>) => {
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const result = await sslcz.validate(data);
  return result;
}

export const SSLCommerzUtils = {
  initPayment,
  validatePayment
}
