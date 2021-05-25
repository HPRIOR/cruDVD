import { Field, ObjectType } from 'type-graphql';
import { User } from '../../entities/User';
import { UserResponseError } from './userResponseError';

@ObjectType()
export class UserResponse {
    @Field({ nullable: true })
    errors?: UserResponseError;

    @Field(() => User, { nullable: true })
    user?: User;
}
