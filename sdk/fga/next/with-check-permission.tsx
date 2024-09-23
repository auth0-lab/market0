type WithCheckPermissionParams<PageParams> = {
  checker: (toolParams: PageParams) => Promise<boolean>;
  onUnauthorized?: (toolParam: PageParams) => Promise<JSX.Element>;
};

const DEFAULT_UNAUTHORIZED_MESSAGE =
  "You are not authorized to perform this action.";

async function defaultOnUnauthorized() {
  return <div>${DEFAULT_UNAUTHORIZED_MESSAGE}</div>;
}

/**
 * Wrap a Serverless page with an FGA permission check.
 * @param params
 * @param params.checker - A function that receives the same parameter
 *     than the serverless function and checks
 *     if the user has permission to access the page.
 *     This can be `withFGA`.
 * @param params.onUnauthorized - A function that receives the same parameter
 *     than the serverless function and returns a JSX element.
 *     This can be used to customize the unauthorized message.
 * @param fn - The serverless function to wrap.
 * @returns A new serverless function that checks permissions before executing the original function.
 */
export function withCheckPermission<PageParams = any>(
  params: WithCheckPermissionParams<PageParams>,
  fn: (toolParam: PageParams) => Promise<JSX.Element>
) {
  return async function (toolParam: PageParams): Promise<JSX.Element> {
    let allowed = false;

    try {
      allowed = await params.checker(toolParam);
    } catch (e) {
      console.error(e);
    }

    if (allowed) {
      return fn(toolParam);
    } else {
      if (params.onUnauthorized) {
        return params.onUnauthorized(toolParam);
      }

      return defaultOnUnauthorized();
    }
  };
}
