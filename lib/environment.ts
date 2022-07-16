enum Environments {
  local_environment = 'local',
  dev_environment = 'dev',
  prod_environment = 'prod',
  qa_environment = 'qa',
}

class Environment {
  private environment: string;

  constructor(environment: string) {
    this.environment = environment;
  }

  getPort(): number {
    if (this.environment === Environments.prod_environment) {
      return 8081;
    }
    if (this.environment === Environments.dev_environment) {
      return 8082;
    }
    if (this.environment === Environments.qa_environment) {
      return 8083;
    }
    return 8000;
  }

  getDBName(): string {
    if (this.environment === Environments.prod_environment) {
      return 'db_usaf_website_prod';
    }
    if (this.environment === Environments.dev_environment) {
      return 'db_usaf_website_dev';
    }
    if (this.environment === Environments.qa_environment) {
      return 'db_usaf_website_qa';
    }
    return 'db_usaf_website_local';
  }
}
/**
 * Instantiate base on environment - default to local environment
 */
export default new Environment(Environments.local_environment);
