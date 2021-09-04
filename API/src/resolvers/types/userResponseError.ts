import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UserResponseError {
    @Field(() => [String], { nullable: true })
    userError?: string[];
    @Field(() => [String], { nullable: true })
    passError?: string[];
    @Field(() => [String], { nullable: true })
    emailError?: string[];
    @Field(() => [String], { nullable: true })
    genericError?: string[];
}
