import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';
import { MediaEntity } from '../../../utils/media.entity';

@Entity()
export class SliderEntity extends FixedEntity {
	@Column()
	title: string;

	@Column()
	subtitle: string;

	@OneToOne(() => MediaEntity, (file) => file.slider, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	media: MediaEntity;

	@Column()
	link: string;

	@Column()
	order: number;

	@Column()
	status: boolean;
}
