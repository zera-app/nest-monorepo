import { DateUtils } from '../date/date.utils';

export const tokenLifeTime = DateUtils.addHours(DateUtils.now(), 1).toDate();
