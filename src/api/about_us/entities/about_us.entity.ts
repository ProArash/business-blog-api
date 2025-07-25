import { Column, Entity } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';

@Entity()
export class AboutUsEntity extends FixedEntity {
	@Column('text')
	content: string;

	@Column({
		nullable: true,
	})
	imageUrl: string;
}
