import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface BackendCarUnit {
  id: string;
  carId: string;
  name: string;
  status: 'available' | 'reserved' | 'in_use' | 'maintenance';
  currentUserId: string | null;
  battery: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarUnit {
  id: string;
  carId: string;
  name: string;
  status: 'available' | 'reserved' | 'in_use' | 'maintenance';
  currentUserId: string | null;
  battery: number;
  createdAt: Date;
  updatedAt: Date;
}

class CarUnitsService {
  private transformBackendCarUnit(backendUnit: BackendCarUnit): CarUnit {
    return {
      id: backendUnit.id,
      carId: backendUnit.carId,
      name: backendUnit.name,
      status: backendUnit.status,
      currentUserId: backendUnit.currentUserId,
      battery: backendUnit.battery,
      createdAt: new Date(backendUnit.createdAt),
      updatedAt: new Date(backendUnit.updatedAt),
    };
  }

  async getCarUnitById(unitId: string): Promise<CarUnit | null> {
    try {
      const response = await axios.get(`${API_URL}/car-units/${unitId}`);
      const backendUnit: BackendCarUnit = response.data;
      return this.transformBackendCarUnit(backendUnit);
    } catch (error) {
      console.error('Error fetching car unit:', error);
      return null;
    }
  }

  async getCarUnitsByCarId(carId: string): Promise<CarUnit[]> {
    try {
      const response = await axios.get(`${API_URL}/car-units/car/${carId}`);
      const backendUnits: BackendCarUnit[] = response.data;
      return backendUnits.map(unit => this.transformBackendCarUnit(unit));
    } catch (error) {
      console.error('Error fetching car units:', error);
      return [];
    }
  }

  async getAvailableCarUnits(carId: string): Promise<CarUnit[]> {
    try {
      const units = await this.getCarUnitsByCarId(carId);
      return units.filter(unit => unit.status === 'available');
    } catch (error) {
      console.error('Error fetching available car units:', error);
      return [];
    }
  }
}

export const carUnitsService = new CarUnitsService(); 