import { Column, Entity, OneToOne } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { MediaEntity } from '../../../utils/media.entity';

@Entity()
export class AboutUsEntity extends FixedEntity {
	@Column('text')
	content: string;

	@OneToOne(() => MediaEntity, (media) => media.aboutUs, {
		cascade: true,
		onDelete: 'CASCADE',
		eager: true,
	})
	media: MediaEntity;
}
