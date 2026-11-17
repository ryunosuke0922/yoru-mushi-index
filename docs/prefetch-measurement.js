// Run in a fresh browser context on the home page of a production build.
// Set performance.setResourceTimingBufferSize(3000) before navigation.
async () => {
  await new Promise((r) => setTimeout(r, 2500));
  const read = () =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("_rsc"))
      .map((r) => ({ path: new URL(r.name).pathname, bytes: r.transferSize }));
  const initial = read();
  for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 250));
  }
  await new Promise((r) => setTimeout(r, 2000));
  const all = read();
  const index = all.length;
  document.querySelector("a.area-card").scrollIntoView();
  const start = performance.now();
  document.querySelector("a.area-card").click();
  while (
    !document.querySelector(".forecast-card") &&
    performance.now() - start < 30000
  )
    await new Promise((r) => setTimeout(r, 50));
  const navMs = Math.round(performance.now() - start);
  await new Promise((r) => setTimeout(r, 1000));
  return {
    viewport: [innerWidth, innerHeight],
    initial,
    scroll: all.slice(initial.length),
    navigation: read().slice(index),
    navMs,
    forecastVisible: !!document.querySelector(".forecast-card"),
    text: document.querySelector(".forecast-card")?.textContent.slice(0, 250),
  };
};
