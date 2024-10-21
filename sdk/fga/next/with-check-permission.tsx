type WithCheckPermissionParams<Args extends any[], R> = {
  checker: (...args: Args) => Promise<boolean>;
  onUnauthorized?: (...args: Args) => any;
};

const DEFAULT_UNAUTHORIZED_MESSAGE =
  "You are not authorized to perform this action.";

async function defaultOnUnauthorized(): Promise<JSX.Element> {
  return <div>{DEFAULT_UNAUTHORIZED_MESSAGE}</div>;
}

/**
 * Wrap a Serverless page or action with an FGA permission check.
 *
 * @param options
 * @param params.checker - A function that receives the same parameters
 *     as the serverless function and checks
 *     if the user has permission to access the page.
 *     This can be `withFGA`.
 * @param params.onUnauthorized - A function that receives the same parameters
 *     as the serverless function and returns a JSX element.
 *     This can be used to customize the unauthorized message.
 * @param fn - The serverless function to wrap.
 * @returns A new serverless function that checks permissions before executing the original function.
 */
export function withCheckPermission<R, F extends (...args: any[]) => Promise<R>, Args extends Parameters<F>>(
  options: WithCheckPermissionParams<Args, R>,
  fn: F
): F {
  return async function (...args: Args): Promise<R> {
    let allowed = false;

    try {
      allowed = await options.checker(...args);
    } catch (e) {
      console.error(e);
    }

    if (allowed) {
      return fn(...args);
    } else {
      if (options.onUnauthorized) {
        return options.onUnauthorized(...args);
      }

      return defaultOnUnauthorized() as R;
    }
  } as F;
}
