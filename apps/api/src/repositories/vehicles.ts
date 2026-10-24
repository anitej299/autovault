import { db } from "./db.js";
import type { VehicleInput } from "../validators/vehicles.js";
export const vehicles = {
  create: (data: VehicleInput) => db.vehicle.create({ data }),
  update: (id: string, data: VehicleInput) =>
    db.vehicle.update({ where: { id }, data }),
  remove: (id: string) => db.vehicle.delete({ where: { id } }),
};
