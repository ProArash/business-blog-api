import { Test, TestingModule } from '@nestjs/testing';
import { AboutUsService } from './about_us.service';

describe('AboutUsService', () => {
	let service: AboutUsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AboutUsService],
		}).compile();

		service = module.get<AboutUsService>(AboutUsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
