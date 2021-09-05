import { Query, Resolver } from 'type-graphql';
import { injectable } from 'inversify';

@injectable()
@Resolver()
class HelloResolver {
    @Query(() => String)
    hello() {
        return 'hello world';
    }
}

export default HelloResolver;
