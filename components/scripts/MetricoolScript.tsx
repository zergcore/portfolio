import Script from 'next/script';

const MetricoolScript = () => {

  return (
    <Script id="metricool-script">
          {`
          function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"49af8e8a75a09be381dbaa027d0099d1"})});
          `}
    </Script>
  );
};

export default MetricoolScript;