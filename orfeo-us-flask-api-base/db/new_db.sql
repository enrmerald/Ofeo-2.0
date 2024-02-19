-- Creación de tabla 'channels'
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    refcode VARCHAR(15),
    name VARCHAR(60) NOT NULL,
    email VARCHAR(40) NOT NULL,
    phonenum VARCHAR(15) NOT NULL,
    created TIMESTAMP NOT NULL,
    modified TIMESTAMP NOT NULL
);

-- Creación de tabla 'addresses'
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    address VARCHAR(200),
    postal_code INTEGER NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL
);

-- Creación de tabla 'emails'
CREATE TABLE emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(40) NOT NULL,
    created TIMESTAMP NOT NULL,
    modified TIMESTAMP NOT NULL,
    content VARCHAR(200)
);

-- Creación de tabla 'discovery_risk'
CREATE TABLE discovery_risk (
    id SERIAL PRIMARY KEY,
    name VARCHAR(15)
);

-- Creación de tabla 'request_priority'
CREATE TABLE request_priority (
    id SERIAL PRIMARY KEY,
    name VARCHAR(15)
);

-- Creación de tabla 'request_status'
CREATE TABLE request_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(15)
);

-- Creación de tabla 'iplookup'
CREATE TABLE iplookup (
    id SERIAL PRIMARY KEY,
    country VARCHAR(25) NOT NULL,
    organization VARCHAR(50),
    isp VARCHAR(20),
    asn VARCHAR(20)
);

-- Creación de tabla 'whois'
CREATE TABLE whois (
    id SERIAL PRIMARY KEY,
    data_domain VARCHAR(200),
    owner VARCHAR(200),
    dns_info VARCHAR(200)
);

-- Creación de tabla 'https'
CREATE TABLE https (
    id SERIAL PRIMARY KEY,
    jarm_fingerprint VARCHAR(62),
    certificate_version VARCHAR(10),
    serial_number VARCHAR(32),
    thumbprint VARCHAR(40),
    signature_algorithm VARCHAR(15),
    issuer_country VARCHAR(120),
    validity_not_before TIMESTAMP,
    validity_not_after TIMESTAMP,
    subject_common_name VARCHAR(50),
    public_key_algorithm VARCHAR(10),
    public_key_modulus TEXT,
    public_key_exponent VARCHAR(10),
    x509v3_authority_key_id VARCHAR(70),
    x509v3_subject_key_id VARCHAR(70),
    x509v3_subject_alt_name VARCHAR(40),
    x509v3_key_usage VARCHAR(30),
    x509v3_extended_key_usage VARCHAR(15),
    x509v3_crl_distribution_points VARCHAR(150),
    x509v3_certification_policies VARCHAR(70),
    authority_information_access VARCHAR(110),
    x509v3_basic_constraints VARCHAR(110),
    signature_algorithm_final VARCHAR(15),
    signature TEXT
);

-- Creación de tabla 'dns'
CREATE TABLE dns (
    id SERIAL PRIMARY KEY,
    record_type VARCHAR(6) NOT NULL,
    ttl VARCHAR(5),
    valor VARCHAR(100),
    created TIMESTAMP,
    modified TIMESTAMP
);

-- Creación de tabla 'ports'
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    protocol VARCHAR(7),
    state VARCHAR(7),
    service VARCHAR(50) 
);

-- Creación de tabla 'organizations'
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    refcode VARCHAR(15),
    name VARCHAR(60) NOT NULL,
    phonenum VARCHAR(15) NOT NULL,
    active BOOLEAN NOT NULL,
    created TIMESTAMP NOT NULL,
    modified TIMESTAMP NOT NULL,
    fk_channel_id INTEGER REFERENCES channels(id),
    fk_address INTEGER REFERENCES addresses(id),
    fk_email INTEGER REFERENCES emails(id)
);

-- Creación de tabla 'domain'
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    created TIMESTAMP,
    modified TIMESTAMP,
    fk_dns_id INTEGER REFERENCES dns(id),
    fk_https INTEGER REFERENCES https(id),
    fk_organization_id INTEGER REFERENCES organizations(id),
    fk_whois_id INTEGER REFERENCES whois(id)
);

-- Creación de tabla 'ip'
CREATE TABLE ips (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL, -- date se cambia a fecha
    ip VARCHAR(39) NOT NULL,
    verdict VARCHAR(50) NOT NULL,
    indicator VARCHAR(20) NOT NULL,
    external_sources VARCHAR(100) NOT NULL,
    fk_domain_id INTEGER REFERENCES domains(id),
    fk_iplookup INTEGER REFERENCES iplookup(id)
);

ALTER TABLE organizations ADD COLUMN fk_ip INTEGER;
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_ip FOREIGN KEY (fk_ip) REFERENCES ips(id);

-- Creación de tabla 'ip_ports'
CREATE TABLE ip_ports (
    id SERIAL PRIMARY KEY,
    fk_ip_id INTEGER REFERENCES ips(id),
    fk_ports_id INTEGER REFERENCES ports(id)
);

-- Creación de tabla 'domain_ports'
CREATE TABLE domain_ports (
    id SERIAL PRIMARY KEY,
    fk_domain_id INTEGER REFERENCES domains(id),
    fk_ports_id INTEGER REFERENCES ports(id)
);

-- Creación de tabla 'subdomain'
CREATE TABLE subdomains (
    id SERIAL PRIMARY KEY,
    name_subdomain VARCHAR(50),
    detections INTEGER,
    fk_domain_id INTEGER REFERENCES domains(id),
    fk_ip_id INTEGER REFERENCES ips(id)
);

-- Creación de tabla 'discoveries'
CREATE TABLE discoveries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50),
    description VARCHAR(200),
    source VARCHAR(25),
    blacklist_date TIMESTAMP,
    created TIMESTAMP,
    modified TIMESTAMP,
    fk_organization_id INTEGER REFERENCES organizations(id),
    fk_risk_id INTEGER REFERENCES discovery_risk(id)
);

-- Creación de tabla 'requests'
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    description VARCHAR(200),
    response TEXT,
    created TIMESTAMP,
    modified TIMESTAMP,
    fk_discovery_id INTEGER REFERENCES discoveries(id),
    fk_request_status INTEGER REFERENCES request_status(id),
    fk_request_priority INTEGER REFERENCES request_priority(id)
);

CREATE TABLE user_settings (
	id serial NOT NULL,
	user_token varchar(200) NULL,
	settings varchar(200) NULL
);