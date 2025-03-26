-- Insert sample data
insert into samples (
    name,
    type,
    location,
    collection_date,
    storage_condition,
    quantity,
    price,
    description,
    latitude,
    longitude,
    hash
) values
    (
        'Marine Bacterial Culture XB-1',
        'bacterial',
        'Pacific Ocean - Station Alpha',
        '2023-09-15',
        '-80°C Ultra-freezer',
        5,
        299.99,
        'Deep-sea thermophilic bacteria isolated from hydrothermal vent',
        23.4558,
        -45.6789,
        md5('Marine Bacterial Culture XB-1:bacterial:Pacific Ocean - Station Alpha:2023-09-15:-80°C Ultra-freezer')
    ),
    (
        'Alpine Soil Sample AS-22',
        'soil',
        'Swiss Alps - Matterhorn Region',
        '2023-10-01',
        'Room temperature',
        3,
        149.50,
        'High-altitude soil sample with unique microbial composition',
        45.9766,
        7.6582,
        md5('Alpine Soil Sample AS-22:soil:Swiss Alps - Matterhorn Region:2023-10-01:Room temperature')
    ),
    (
        'Preserved Plant Tissue PT-7',
        'botanical',
        'Amazon Rainforest - Brazil',
        '2023-08-20',
        'Liquid nitrogen',
        8,
        199.99,
        'Rare medicinal plant tissue with potential therapeutic compounds',
        -3.4653,
        -62.2159,
        md5('Preserved Plant Tissue PT-7:botanical:Amazon Rainforest - Brazil:2023-08-20:Liquid nitrogen')
    ),
    (
        'Human Cell Line HC-15',
        'cell line',
        'Stanford Medical Center',
        '2023-11-05',
        '-196°C Cryogenic storage',
        2,
        599.99,
        'Authenticated human fibroblast cell line for research',
        37.4329,
        -122.1746,
        md5('Human Cell Line HC-15:cell line:Stanford Medical Center:2023-11-05:-196°C Cryogenic storage')
    ); 