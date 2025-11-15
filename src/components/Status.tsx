import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { AnimatedView } from './Wrap/AnimatedView';
const Status = () => {
  const appContext = useContext(AppContext);
  if (!appContext) return;
  const regions = appContext.regionsRef.current;
  //   const regions = {
  //     data: `//#region data
  // const data = {a:'Hello'}
  // //#endregion`,
  //     status: `//#region status
  // let status = \`<h1>\${data.a}</h1>\`
  // //#endregion`
  //   };
//   if (!regions) return;
  const data = regions.data.match(/\/\/#region data(.*?)\/\/#endregion/s)?.[1] || '';
  const privateData = regions.privateData.match(/\/\/#region privateData(.*?)\/\/#endregion/s)?.[1] || '';
  const status = regions.status.match(/let status = `(.*?)`/s)?.[1];
  const scriptBody = `
  ${data}
  ${privateData}
  return \`${status}\``;
  let statusEval;
  try {
    const dynamicFunction = new Function(scriptBody);
    statusEval = dynamicFunction();
  } catch (e) {
    toastr.error(String(e));
  }

  return (
      <AnimatedView show={appContext.currentMode === 'Code'}>
        <div dangerouslySetInnerHTML={{ __html: statusEval }} />
      </AnimatedView>
  );
};

export default Status;
