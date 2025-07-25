import { PartialType } from '@nestjs/swagger';
import { CreateSliderDto } from './create-slider.dto';

export class UpdateSliderDto extends PartialType(CreateSliderDto) {
	imageUrl?: string | undefined;
	link?: string | undefined;
	order?: number | undefined;
	status?: boolean | undefined;
	subtitle?: string | undefined;
	title?: string | undefined;
}
