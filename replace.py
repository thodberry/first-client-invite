import sys

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_marker = '    <!-- -- EL CONCEPTO -- -->'
end_marker = '  </div><!-- /#page -->'
start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_html = '''    <!-- -- 1: EL CONCEPTO -- -->
    <div style="text-align: center; max-width: 1000px; margin: 0 auto; padding: 0;">
      <img src="assets/1.jpeg" alt="El Concepto" style="width: 100%; height: auto; display: block;" class="r d1" />
    </div>

    <!-- -- 2: SERÁS TÚ LA ELEGIDA -- -->
    <div style="text-align: center; max-width: 1000px; margin: 0 auto; padding: 0;">
      <img src="assets/2.jpeg" alt="Serás Tú la Elegida" style="width: 100%; height: auto; display: block;" class="r d1" />
    </div>

    <!-- -- LA SEDE -- -->
    <div style="padding: 0; max-width: 1000px; margin: 0 auto;">
      <a href="https://maps.app.goo.gl/NeD2mRd1DtJfp9um6"
        target="_blank" rel="noopener noreferrer"
        style="display: block; text-decoration: none;">
        <img src="assets/reception.jpg" alt="Reception El Olimpo" style="width: 100%; height: auto; display: block;"
          class="r d1" />
      </a>
    </div>

    <!-- -- 4: PREVENTA EXCLUSIVA -- -->
    <div style="text-align: center; max-width: 1000px; margin: 0 auto; padding: 0;">
      <img src="assets/4.jpeg" alt="Preventa Exclusiva" style="width: 100%; height: auto; display: block;" class="r d1" />
    </div>

    <!-- -- 3: GARANTÍA DE SEGURIDAD -- -->
    <div style="text-align: center; max-width: 1000px; margin: 0 auto; padding: 0;">
      <img src="assets/3.jpeg" alt="Garantía de Seguridad" style="width: 100%; height: auto; display: block;" class="r d1" />
    </div>

    <!-- -- 5: INFORMES Y RESERVACIONES -- -->
    <div style="text-align: center; max-width: 1000px; margin: 0 auto; padding: 0;">
      <a href="https://www.instagram.com/zeus.thechosenwife" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none;">
        <img src="assets/5.jpeg" alt="Informes y Reservaciones" style="width: 100%; height: auto; display: block;" class="r d1" />
      </a>
    </div>

'''
    html = html[:start_idx] + new_html + html[end_idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Replaced successfully')
else:
    print('Markers not found')
