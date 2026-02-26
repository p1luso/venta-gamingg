import { Module } from '@nestjs/common';
import { TrustpilotController } from './trustpilot.controller';

@Module({
    controllers: [TrustpilotController],
})
export class TrustpilotModule { }
