import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock, StockDocument } from '../schemas/stock.schema';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const createdStock = new this.stockModel(createStockDto);
    return createdStock.save();
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel.find().exec();
  }

  async findOne(id: string): Promise<Stock | null> {
    return this.stockModel.findById(id).exec();
  }

  async update(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<Stock | null> {
    return this.stockModel
      .findByIdAndUpdate(id, updateStockDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Stock | null> {
    return this.stockModel.findByIdAndDelete(id).exec();
  }
}
