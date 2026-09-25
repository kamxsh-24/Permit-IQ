import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class PlantController {
  public static async getPlants(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plants = await prisma.plant.findMany({
        include: { areas: true },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, plants, 'Plants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getAreas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plantId } = req.query;
      const areas = await prisma.area.findMany({
        where: plantId ? { plantId: String(plantId) } : undefined,
        include: { equipment: true, plant: true },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, areas, 'Areas retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getEquipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { areaId } = req.query;
      const equipment = await prisma.equipment.findMany({
        where: areaId ? { areaId: String(areaId) } : undefined,
        include: { area: true },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, equipment, 'Equipment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
