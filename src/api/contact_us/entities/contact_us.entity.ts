import { Column, Entity } from 'typeorm';
import { FixedEntity } from '../../../utils/fixed.entity';

@Entity()
export class ContactUsEntity extends FixedEntity {
	@Column()
	name: string;

	@Column()
	email: string;

	@Column()
	subject: string;

	@Column('text')
	message: string;
}
