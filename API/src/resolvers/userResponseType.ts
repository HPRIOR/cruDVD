import { Field, ObjectType } from 'type-graphql';
import { User } from '../entities/User';

@ObjectType()
export class UserResponse {
    @Field(() => [String], { nullable: true })
    errors?: string[];

    @Field(() => User, { nullable: true })
    user?: User;
}
