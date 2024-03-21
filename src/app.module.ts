import { Module, Injectable } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import {
  ConfigurationService,
  MessagePatternResponseInterceptor,
  SharedModule,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EldSchema } from './mongoDb/schema/schema';
import { AppController } from './app.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: 'Eld', schema: EldSchema }]),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigurationService) => ({
        uri: configService.mongoUri,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigurationService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigurationService,
    {
      provide: 'UNIT_SERVICE',
      useFactory: (config: ConfigurationService) => {
        const unitServicePort = config.get('UNIT_MICROSERVICE_PORT');
        const unitServiceHost = config.get('UNIT_MICROSERVICE_HOST');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: Number(unitServicePort),
            host: unitServiceHost,
          },
        });
      },
      inject: [ConfigurationService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MessagePatternResponseInterceptor,
    },
    {
      provide: 'UNIT_SERVICE',
      useFactory: (config: ConfigurationService) => {
        const unitServicePort = config.get('UNIT_MICROSERVICE_PORT');
        const unitServiceHost = config.get('UNIT_MICROSERVICE_HOST');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: Number(unitServicePort),
            host: unitServiceHost,
          },
        });
      },
      inject: [ConfigurationService],
    }
  ],
})
export class AppModule {
  static port: number | string;
  static isDev: boolean;

  constructor(private readonly _configurationService: ConfigurationService) {
    AppModule.port = AppModule.normalizePort(_configurationService.port);
    AppModule.isDev = _configurationService.isDevelopment;
  }

  /**
   * Normalize port or return an error if port is not valid
   * @param val The port to normalize
   */
  private static normalizePort(val: number | string): number | string {
    const port: number = typeof val === 'string' ? parseInt(val, 10) : val;

    if (Number.isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    throw new Error(`Port "${val}" is invalid.`);
  }
}
