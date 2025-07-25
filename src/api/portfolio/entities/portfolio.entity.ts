import { Column, Entity, OneToOne } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { MediaEntity } from '../../../utils/media.entity';

@Entity()
export class PortfolioEntity extends FixedEntity {
	@Column()
	title: string;

	@Column('text')
	description: string;

	@OneToOne(() => MediaEntity, (media) => media.portfolio)
	media: MediaEntity;

	@Column()
	url: string;
}
